import * as React from 'react';
import { IReactProps } from '../../types';
import { Doughnut } from 'react-chartjs-2';
import { IProject } from '../../stores/ConfigStore';
import moment from 'moment-es6';
import { firestorable } from '../../Firestorable/Firestorable';
import store from '../../stores/RootStore';
import * as chartjs from 'chart.js';
import { chartColors } from './RegistrationsPerProject';
import { legendCallback } from './helpers';

interface ITaskReportData extends IProject {
    totalTime: number;
}

export class RegistrationsPerTask extends React.Component<IReactProps, { data: chartjs.ChartData }> {
    private ref: React.RefObject<any>;
    private legendRef: React.RefObject<HTMLDivElement>;

    constructor(props: IReactProps) {
        super(props);

        this.ref = React.createRef();
        this.legendRef = React.createRef();

        this.state = { data: { datasets: [] } };

        getData(2019).then(r => {
            r = r.sort((a, b) => a.totalTime > b.totalTime ? -1 : a.totalTime < b.totalTime ? 1 : 0);
            this.setState({
                ...this.state, ...{
                    data: {
                        datasets: [
                            {
                                data: r.map(d => d.totalTime),
                                backgroundColor: [
                                    chartColors.red,
                                    chartColors.orange,
                                    chartColors.yellow,
                                    chartColors.green,
                                    chartColors.blue
                                ]
                            }
                        ],
                        labels: r.map(d => d.name),
                    }
                }
            });
        })
    }

    componentDidUpdate() {
        if (this.ref.current
            && this.legendRef.current) {
            this.legendRef.current!.innerHTML = this.ref.current.chartInstance.generateLegend();
        }
    }

    render() {
        return (
            <div className="chart-container" style={{ position: "relative", width: "50%" }}>
                <Doughnut ref={this.ref} options={{ legend: { display: false }, legendCallback, title: { text: "Time / Task in 2019", display: true }, responsive: true }} data={this.state.data}></Doughnut>
                <div className="legend" ref={this.legendRef}></div>
            </div>
        );
    }
}

const getData = (year: number) => {
    let tasksMap: Map<string, ITaskReportData>;

    const startMonent = moment(`${year}`, 'YYYY');
    const endDate = startMonent.clone().endOf("year").toDate();
    const startDate = startMonent.clone().startOf("year").toDate();

    return Promise.all([
        firestorable.firestore.collection('tasks').get().then(s => tasksMap = new Map(s.docs.map((d): [string, any] => [d.id, { ...d.data(), totalTime: 0 }])))
    ]).then(() => firestorable.firestore.collection('registrations')
        .where("deleted", "==", false)
        .where("date", ">=", startDate)
        .where("date", "<=", endDate)
        .where("userId", "==", store.user.userId)
        .get()
        .then(querySnapshot => {
            const registrations: any[] = [];

            // create array of registration data
            querySnapshot.forEach(doc => {
                const fireStoreData = doc.data();
                const project = fireStoreData.project;
                const task = fireStoreData.task;
                const date = fireStoreData.date.toDate().getDate();

                delete fireStoreData.deleted;
                delete fireStoreData.userId;
                registrations.push({ ...fireStoreData, project, task, date });
            });

            registrations.forEach(r => {
                const task = tasksMap.get(r.task);
                if (task) {
                    task.totalTime = task.totalTime + r.time;
                }
            });

            return Array.from(tasksMap.values());
        }))
};