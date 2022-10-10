import {PromptObject} from "prompts";
import {Event, Organization} from "spirit-link";

export const loginPrompt: PromptObject[] = [{
  type: "text",
  name: "email",
  message: "Email:",
}, {
  type: "password",
  name: "password",
  message: "Password:",
}];

export const actionsPrompt: PromptObject = {
  type: "select",
  name: "action",
  message: "Choose one:",
  choices: [{
    title: "Add new event to the head count",
    value: "addNew",
  }, {
    title: "Quit",
    value: "quit",
  }],
};

export const confirmPrompt: PromptObject = {
  type: "select",
  name: "confirmed",
  message: "Are you sure?",
  choices: [{
    title: "No",
    value: false,
  }, {
    title: "Yes",
    value: true,
  }]
}

export const createOrgPrompt = (orgs: Organization[]): PromptObject => {
  return {
    type: "select",
    name: "org",
    message: "Which org?",
    choices: orgs.map((org) => {
      return {
        title: org.name,
        value: org,
      };
    })
  }
}

export const createEventPrompt = (events: Event[]): PromptObject => {
  return {
    type: "select",
    name: "event",
    message: "Which event?",
    choices: events.map((event) => {
      return {
        title: `${event.title} (${event.scheduledStartTime})`,
        value: event,
      };
    })
  }
}
