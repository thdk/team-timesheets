import * as React from 'react';
import * as chartjs from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { ICollection } from "firestorable";
import { IGroupedRegistrations } from '../../../stores/registration-store';
import { IUser, IUserData } from '../../../../common/dist';
import { legendCallback } from './helpers';

export enum ChartType {
    Doughnut,
    Bar
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

export interface IRegistrationsChartProps<T, K = T> {
    labelCollection: ICollection<T, K>;
    getLabel: (data: T) => string;
    data: IGroupedRegistrations<any>[];
    title: string;
    chart: ChartType;
}

export interface IUserRegistrationsChartProps extends IRegistrationsChartProps<IUser, IUserData> {
    data: IGroupedRegistrations<string>[];
}

export class RegistrationsChart<T, K> extends React.Component<IRegistrationsChartProps<T, K>, { data: chartjs.ChartData }> {
    private ref: React.RefObject<any>;
    private legendRef: React.RefObject<HTMLDivElement>;

    constructor(props: IRegistrationsChartProps<T, K>) {
        super(props);

        this.ref = React.createRef();
        this.legendRef = React.createRef();

        this.state = { data: { datasets: [] } };
    }

    componentDidUpdate() {
        if (this.ref.current
            && this.legendRef.current) {
            this.legendRef.current!.innerHTML = this.ref.current.chartInstance.generateLegend();
        }

        const { labelCollection, data, getLabel } = this.props;

        if (!this.state.data.datasets!.length || (this.state.data.datasets![0].data! as unknown as number[]).reduce((p, c) => p += c, 0) !== data.reduce((p, c) => p += c.totalTime, 0))
            this.setState({
                data: {
                    datasets: [
                        {
                            data: data.map(g => g.totalTime),
                            backgroundColor: chartColorsArray
                        }
                    ],
                    labels: data.map(d => {
                        const label = labelCollection.get(d.groupKey);
                        return label ? getLabel(label.data!) : "Archived";
                    })
                }
            });
    }

    render() {
        const { labelCollection, data, title, chart: chartType } = this.props;
        if (!labelCollection.docs.length || !data.length) return <></>;

        const chartProps = {
            ref: this.ref,
            options: {
                legendCallback,
                legend: { display: false },
                title: { text: title, display: true },
                responsive: true,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            },
            data: this.state.data
        };

        let chart: React.ReactNode;
        switch (chartType) {
            case ChartType.Bar:
                chart = <Bar {...chartProps}></Bar>;
                break;
            case ChartType.Doughnut:
                chart = <Doughnut {...chartProps}></Doughnut>;
                break;
        }

        return (
            <div className="chart-container" style={{ position: "relative" }}>
                {chart}
                <div className="legend" ref={this.legendRef}></div>
            </div>
        )
    }
}