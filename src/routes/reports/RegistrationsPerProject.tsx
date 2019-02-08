import * as React from 'react';
import { IReactProps } from '../../types';
import { Doughnut } from 'react-chartjs-2';
import { ITask, IProject } from '../../stores/ConfigStore';
import moment from 'moment-es6';
import { firestorable } from '../../Firestorable/Firestorable';
import store from '../../stores/RootStore';
import * as chartjs from 'chart.js';
import { legendCallback } from './helpers';

interface IProjectReportData extends IProject {
    totalTime: number;
}

export const chartColors = {
    blue: "rgb(54, 162, 235)",
    green: "rgb(75, 192, 192)",
    grey: "rgb(201, 203, 207)",
    orange: "rgb(255, 159, 64)",
    purple: "rgb(153, 102, 255)",
    red: "rgb(255, 99, 132)",
    yellow: "rgb(255, 205, 86)"
}

export const chartColorsArray = [
    chartColors.red,
    chartColors.orange,
    chartColors.yellow,
    chartColors.green,
    chartColors.blue,
    chartColors.purple
];

export class RegistrationsPerProject extends React.Component<IReactProps, { data: chartjs.ChartData }> {
    private ref: React.RefObject<any>;
    private legendRef: React.RefObject<HTMLDivElement>;

    constructor(props: IReactProps) {
        super(props);
        this.state = { data: { datasets: [] } };

        this.ref = React.createRef();
        this.legendRef = React.createRef();

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
                                    chartColors.blue,
                                ]
                            }
                        ],
                        labels: r.map(d => d.name)
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
                <Doughnut ref={this.ref} options={{ legendCallback, legend: { display: false }, title: { text: "Time / project in 2019", display: true }, responsive: true }} data={this.state.data}></Doughnut>
                <div className="legend" ref={this.legendRef}></div>
            </div>
        );
    }
}

const getData = (year: number) => {
    let projectsMap: Map<string, IProjectReportData>;
    let tasksMap: Map<string, ITask>;

    const startMonent = moment(`${year}`, 'YYYY');
    const endDate = startMonent.clone().endOf("year").toDate();
    const startDate = startMonent.clone().startOf("year").toDate();

    return Promise.all([
        firestorable.firestore.collection('projects').get()
            .then(
                s => projectsMap = new Map(s.docs.map((d): [string, any] =>
                    [d.id, { ...d.data(), totalTime: 0 }])
                )
            ),
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
                const taskData = tasksMap.get(fireStoreData.task);
                const project = fireStoreData.project;
                const task = taskData ? taskData.name : fireStoreData.task;
                const date = fireStoreData.date.toDate().getDate();

                delete fireStoreData.deleted;
                delete fireStoreData.userId;
                registrations.push({ ...fireStoreData, project, task, date });
            });

            registrations.forEach(r => {
                const project = projectsMap.get(r.project);
                if (project) {
                    project.totalTime = project.totalTime + r.time;
                }
            });

            return Array.from(projectsMap.values());
        }))
};