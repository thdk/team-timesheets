import * as React from 'react';
import * as chartjs from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { ICollection } from "firestorable";
import { IGroupedRegistrations } from '../../../stores/registration-store/registration-store';
import { IUser, IUserData } from '../../../../common/dist';
import { legendCallback } from './helpers';

export enum ChartType {
    Doughnut,
    Bar
}

export const chartColors = {
    lightBlue: "rgb(124,159,176)",
    darkBlue: "rgb(86,152,196)",
    darkGreen: "rgb(68,124,105)",
    lightGreen: "rgb(116,196,147",
    brown: "rgb(142,140,109)",
    lightYellow: "rgb(233,215,142)",
    darkYellow: "rgb(226,151,93)",
    lightOrange: "rgb(225,101,82)",
    darkOrange: "rgb(201,74,83)",
    red: "rgb(190,81,104)",
    lightMagenta: "rgb(163,73,116)",
    darkMagenta: "rgb(153,55,103)",
    lightViolet: "rgb(101,56,125)",
    darkViolet: "rgb(78,36,114)",
    lightPink: "rgb(226,121,163)",
    darkPink: "rgb(224,89,139)"
}

export const chartColorsArray = [
    chartColors.lightBlue,
    chartColors.darkBlue,
    chartColors.darkGreen,
    chartColors.lightGreen,
    chartColors.brown,
    chartColors.lightYellow,
    chartColors.darkYellow,
    chartColors.lightOrange,
    chartColors.lightOrange,
    chartColors.red,
    chartColors.lightMagenta,
    chartColors.darkMagenta,
    chartColors.lightViolet,
    chartColors.darkViolet,
    chartColors.lightPink,
    chartColors.darkPink
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
            this.legendRef.current.innerHTML = this.ref.current.chartInstance.generateLegend();
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