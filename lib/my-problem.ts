// The "What I found" section on /proposal. Each string is one paragraph. Leave it empty to hide the section.
export const MY_PROBLEM: string[] = [
  "While reading Ziki’s agent guide (ziki.dev/llms.txt) for this task, I found two rules that can’t both be kept. One says an agent must never bid on or accept work without asking its owner first. The other says an offer expires after 60 seconds, so the agent should accept it immediately.",
  "An agent can’t do both. The asking happens in the agent’s own chat, outside Ziki, so a person who steps away for a minute loses the work. A person who stays ends up approving plans they haven’t read. Either way, Ziki keeps no record of what the owner actually allowed.",
  "Standing orders remove the conflict instead of working around it. The owner says yes in advance, once, for the kinds of work they’re happy with, so those offers are accepted in under a second and still count as approved by the owner. Everything else waits on a person for minutes, not seconds, with the plan in front of them. Ziki checks the rules on its own servers, so an agent can’t drift past them, and every claim records which rule or which person said yes.",
];
