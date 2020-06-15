package agent;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import javax.annotation.PostConstruct;
import javax.ejb.AccessTimeout;
import javax.ejb.EJB;
import javax.ejb.LocalBean;
import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Remote;
import javax.ejb.Singleton;
import javax.inject.Inject;
import javax.naming.NamingException;

import node.AgentCenter;
import serverCommunications.Communications;
import serverCommunications.ConnectionsBean;
import util.AgentTypesJndiFinder;
import util.ObjectFactory;
import util.WSMessageCreator;

@Singleton
@Remote(AgentManager.class)
@LocalBean
@AccessTimeout(value = 60, unit = TimeUnit.SECONDS)
public class AgentManagerBean implements AgentManager {

	private HashMap<AID, Agent> agents;

	@EJB
	private AgentTypesJndiFinder agentTypesFinder;
	@EJB
	private WSMessageCreator wsMessageCreator;

	@EJB
	private Communications communications;

	@Inject
	ConnectionsBean communicate;

	@PostConstruct
	public void postConstruct() {
		agents = new HashMap<AID, Agent>();
	}

	@Override
	public List<AgentType> getAvailableAgentClasses() {
		try {
			return agentTypesFinder.parse();
		} catch (NamingException ex) {
			throw new IllegalStateException(ex);
		}
	}

	@Override
	public List<AID> getRunningAgents() {
		Set<AID> set = agents.keySet();
		if (set.size() > 0) {
			AID aid = set.iterator().next();
			try {
				AgentCenter host = (aid.getHost().getAddress().equals(communications.getAgentCenter().getAddress()))
						? null
						: aid.getHost();
				System.out.println("*****HOST********");
				System.out.println(host);
				try {
					ObjectFactory.lookup(getAgentLookup(aid.getType(), true), Agent.class, host);
					System.out.println("MALI TRY");
				} catch (Exception ex) {
					ObjectFactory.lookup(getAgentLookup(aid.getType(), false), Agent.class, host);
					System.out.println("MALI CATCH");
				}
			} catch (Exception ex) {
				set.remove(aid);
				agents.remove(aid);
				System.out.println("VELIKI CATCH");
			}
		}
		return new ArrayList<AID>(set);
	}

	@Override
	public AID startServerAgent(AgentType type, String name) throws IOException {

		AgentCenter host = communications.getAgentCenter();

		AID aid = new AID(name, type, host);
		Agent agent = null;

		try {
			String path = getAgentLookup(aid.getType(), true);
			agent = ObjectFactory.lookup(path, Agent.class, null);
		} catch (IllegalStateException ex) {
			String path = getAgentLookup(aid.getType(), false);
			agent = ObjectFactory.lookup(path, Agent.class, null);
		}

		agent.init(aid);
		agents.put(aid, agent);

		try {
			wsMessageCreator.sendActiveAgents(getRunningAgents());
			communicate.sendRunningAgentsToEveryone(agents.keySet());
		} catch (IOException e) {
			e.printStackTrace();
		}

		return aid;
	}

	@Override
	public void stopAgent(AID aid) {
		Agent agent = agents.get(aid);
		agents.remove(aid);
		try {
			wsMessageCreator.sendActiveAgents(getRunningAgents());
			communicate.sendRunningAgentsToEveryone(agents.keySet());
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private String getAgentLookup(AgentType agType, boolean stateful) {
		if (agType.getModule().contains("/")) {
			// in ear file
			if (stateful)
				return String.format("ejb:%s//%s!%s?stateful", agType.getModule(), agType.getName(),
						Agent.class.getName());
			else
				return String.format("ejb:%s//%s!%s", agType.getModule(), agType.getName(), Agent.class.getName());
		} else {
			// in jar file
			if (stateful)
				return String.format("ejb:/%s//%s!%s?stateful", agType.getModule(), agType.getName(),
						Agent.class.getName());
			else
				return String.format("ejb:/%s//%s!%s", agType.getModule(), agType.getName(), Agent.class.getName());
		}
	}

	public Agent getAgent(AID aid) {
		Agent a = null;
		a = agents.get(aid);
		return a;
	}

	@Lock(LockType.READ)
	@AccessTimeout(value=50000)
	public HashMap<AID, Agent> getAgents() {
		return agents;
	}
	@Lock(LockType.WRITE)
	@AccessTimeout(value=50000)
	public void setAgents(HashMap<AID, Agent> agents) {
		this.agents = agents;
	}

	public void putAgent(AID aid, Agent agent) {
		agents.put(aid, agent);
	}

}
