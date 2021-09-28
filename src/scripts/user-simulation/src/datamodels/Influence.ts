/**
 * The format of the sources, or the interests of the users
 */
export interface IInfluence{
    /**
     * See [[Influence.name]]
     */
    name : string;
    /**
     * See [[Influence.showsIn]]
     */
    showsIn?: number[]
}

export class Influence{
    /**
     * Is the name of the influence.
     */
    name : string
    /**
     * This is used as an reference ID. Here you can reference a module, that was created because of this Influence.
     */
    showsIn : number[]

    constructor({name, showsIn = []}:IInfluence) {
        this.name = name
        this.showsIn = showsIn
    }
}