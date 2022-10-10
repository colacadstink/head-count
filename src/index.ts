import {Event, EventlinkClient, Organization} from "spirit-link";
import prompts from "prompts";
import {
  actionsPrompt,
  confirmPrompt,
  createEventPrompt,
  createOrgPrompt,
  loginPrompt
} from "./promptsConfigs.js";

const quitOnCancel = {onCancel: () => process.exit(1)};

const client = new EventlinkClient();
if(process.env.EVENTLINK_EMAIL && process.env.EVENTLINK_PASSWORD) {
  console.log(`Using ENV vars to log in as ${process.env.EVENTLINK_EMAIL}`);
  await client.login(process.env.EVENTLINK_EMAIL, process.env.EVENTLINK_PASSWORD);
} else {
  const answers = await prompts(loginPrompt, quitOnCancel);
  await client.login(answers.email, answers.password);
}

const me = await client.getMe();
const myOrgs = me.roles.map((r) => r.organization);

if(myOrgs.length === 0) {
  console.error("You don't belong to any organizations, so you cannot snoop on events.");
  process.exit(1);
}

const names = new Set();

let continueLooping = true;
while(continueLooping) {
  const {action} = await prompts(actionsPrompt);
  switch (action) {
    case "addNew":
      let org: Organization;
      if(myOrgs.length === 1) {
        org = myOrgs[0];
      } else {
        org = (await prompts(createOrgPrompt(myOrgs))).org as Organization;
      }
      if(!org) continue;

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate()-14);
      const events = await client.getEvents(org.id, {startDate: twoWeeksAgo,  endDate: new Date()});
      const eventList = [...events.events].reverse();
      const event = (await prompts(createEventPrompt(eventList))).event as Event;
      if(!event) continue;

      const eventDetails = await client.getEventInfo(event.id);

      const players = eventDetails.registeredPlayers.map((reg) => `${reg.firstName} ${reg.lastName}`);
      const oldNamesCount = names.size;
      players.forEach((name) => {
        names.add(name);
      });
      console.log(`Event data added! ${players.length} players in the event; ${names.size - oldNamesCount} new ones.`);
      console.log(`New total unique players: ${names.size}`);
      break;
    default:
      const result = await prompts(confirmPrompt);
      if(result.confirmed || result.confirmed === undefined) { // Ctrl+C makes this undefined
        continueLooping = false;
        process.exit(0);
      }
  }
}
