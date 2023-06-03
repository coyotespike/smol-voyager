# smol-voyager

aka

### ✨ BabyAGI Voyager with Reflexion ✨

This project aims to develop a usable coding agent, which will work iteratively in collaboration with a developer.

The planning agent will develop a multi-step plan and ask for feedback. Then the execution agent will work on each step in the plan. Before creating or editing files, the agent asks for permission.

Inspired by Jim Fan et al's work on Voyager, this agent will create tools as needed, by writing TypeScript files. The project also aims to adopt a Reflexion approach.

Your agent will therefore adapt to your work habits, building tools and course-correcting experience based on your history with this agent.

# Usage

Run `yarn`, then `yarn make-global`. Then you can run `yarn link smol-voyager` from the root of any project to enable the agent for that project.

You should also put your OpenAI key in your .bashrc or .zshrc file, like this:

```
export OPENAI_API_KEY=yourkeyhere
```

`smol-voyager run` will initiate the agent.

# Motivation and Inspiration

AutoGPT and other approaches are unreliable without human guidance. On the other hand, ChatGPT can do amazing work on an incredibly variety of mundane programming tasks with human guidance (so far, it does top out).

Currently, you can only access the full power of ChatGPT with a lot of copy-paste. Instead we want the agent's ability to create and edit files for us, from the command line. We want to use it flexibly, as much or as little as we want. It should complement our workflow - Doom Emacs, Spacemacs, Vim/Vi.

This project started as a fork of BabyAGI-ts, a port of [@yoheinakajima](https://twitter.com/yoheinakajima)'s [BabyAGI](https://github.com/yoheinakajima/babyagi) from Python to TypeScript. While it still uses HNSWLib, the project may change dramatically as it develops.

# Features

- TypeScript
- Iterative workflow from the command line
- Context aware: creates files in the appropriate directory
- Minimalist TDD approach
- Checks with human for live feedback

# Development Roadmap

- [x] Ask for task list approval/editing before sending to executor agent
- Embed files on creation/update
- Embed all files in project
- Allow babyagi to create and edit files
- eventually, [Voyager](https://github.com/MineDojo/Voyager/tree/main/voyager) approach, build up skills list
- Add a separate memory store for [Reflexion](https://github.com/noahshinn024/reflexion)
- Maybe switch to Chroma for embeddings
- Maybe use qlora to implement Toolformer. Can reflexion/Voyager provide training data?

# From Scratch Workflow
- Architect makes high-level plan
- Tech Lead plans steps with tools, creating tools if necessary
- Developer carries out plan, checking with human at each step

# Direct Instruction Workflow
- Issue instructions directly to the developer
- Developer receives all/multiple relevant files, creates/edits functions
- After human authorization, Developer creates/edits relevant files

# Common Abilities
- Receive all relevant files via embeddings
- Aware of project structure (knows where to create/edit files)
- Sees test and runtime errors, recommends fixes
