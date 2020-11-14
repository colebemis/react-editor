import { assign, Machine } from 'xstate'

type AppEvent = { type: 'CODE_CHANGE'; value: string }

interface AppContext {
  code: string
}

export default Machine<AppContext, AppEvent>(
  {
    id: 'app',
    initial: 'idle',
    states: {
      idle: {
        on: {
          CODE_CHANGE: {
            actions: 'setCode',
          },
        },
      },
    },
  },
  {
    actions: {
      setCode: assign({ code: (context, event) => event.value }),
    },
  },
)
