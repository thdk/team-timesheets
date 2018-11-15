interface ICollection<T> {
    docs: {[id: string]: IDocument}
}


interface IDocument {
    id: string;
}

interface IBook {
    author: string;
    title: string;
}


class Doc implements IDocument {
   public readonly id: string;

   constructor(id: string) {
       this.id = id;
   }
}

class Collection<T> implements ICollection<T> {
    public docs: ICollection<T>["docs"] = {};

    public subscribe() {

    }
}

class Firestorable {
    public collections: {[name: string]: ICollection<IDocument>} = {};
}

interface IAppStore {
    books: ICollection<IBook>;
}