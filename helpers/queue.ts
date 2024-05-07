interface QueueItem {
    promise: any;
    resolve: any;
    reject: any;
}

export class Queue {
    static queue: QueueItem[] = [];
    static workingOnPromise = false;

    static enqueue(promise: any) {
        return new Promise((resolve, reject) => {
            this.queue.push({ promise, resolve, reject });
            this.dequeue();
        });
    }

    static dequeue() {
        if (this.workingOnPromise) {
            return false;
        }

        const item = this.queue.shift();
        if (!item) {
            return false;
        }

        try {
            this.workingOnPromise = true;
            item.promise()
                .then((value: any) => {
                    this.workingOnPromise = false;
                    item.resolve(value);
                    this.dequeue();
                })
                .catch((error: Error) => {
                    this.workingOnPromise = false;
                    item.reject(error);
                    this.dequeue();
                });
        } catch (error) {
            this.workingOnPromise = false;
            item.reject(error);
            this.dequeue();
        }

        return true;
    }
}
