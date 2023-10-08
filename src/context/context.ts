import { Context as TelegrafContext } from 'telegraf'

export interface IScene {
    enter: (sceneId: string) => void;
}
  
export interface SceneContext extends TelegrafContext {
    scene?: IScene;
}

export type MyWizardContext = any