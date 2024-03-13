import { BehaviorSubject } from 'rxjs';

const dataSubscriber = new BehaviorSubject({});

const dataService = {
    send: (value) => {
        dataSubscriber.next(value);
    },
};

export { dataService, dataSubscriber };
