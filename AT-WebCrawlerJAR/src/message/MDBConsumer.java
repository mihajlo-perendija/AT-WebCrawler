package message;

import javax.ejb.ActivationConfigProperty;
import javax.ejb.EJB;
import javax.ejb.MessageDriven;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageListener;
import javax.jms.ObjectMessage;

import agent.AID;
import agent.Agent;
import agent.AgentManagerBean;


@MessageDriven(activationConfig = {
		@ActivationConfigProperty(propertyName = "destinationType", propertyValue = "javax.jms.Queue"),
		@ActivationConfigProperty(propertyName = "destination", propertyValue = "jms/queue/siebog")
})
public class MDBConsumer implements MessageListener {

	@EJB
	private AgentManagerBean agm;

	@Override
	public void onMessage(Message msg) {
		try {
			processMessage(msg);
		} catch (JMSException ex) {
			System.out.println("Cannot process an incoming message.");
		}
	}

	private void processMessage(Message msg) throws JMSException {
		ACLMessage acl = (ACLMessage) ((ObjectMessage) msg).getObject();
		AID aid = getAid(msg, acl);
		deliverMessage(acl, aid);
	}
	
	private AID getAid(Message msg, ACLMessage acl) throws JMSException {
		int i = msg.getIntProperty("AIDIndex");
		return acl.receivers.get(i);
	}

	
	private void deliverMessage(ACLMessage msg, AID aid) {
		Agent agent = agm.getAgent(aid);
		if (agent != null) {
			agent.handleMessage(msg);
		} else {
			System.out.println("No such agent: {}");
		}
	}
}