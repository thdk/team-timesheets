import * as React from 'react';
import * as chartjs from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { chartColorsArray } from '../../../routes/reports/RegistrationsPerProject';
import { legendCallback } from '../../../routes/reports/helpers';

import { IGroupedRegistrations } from '../../../stores/TimesheetsStore';

export interface IRegistrationsChartProps {
    getLabels: () => Promise<{[key: string]:  string }>;
    data: IGroupedRegistrations<any>[];
}

export interface IRegistrationPerUserProps extends IRegistrationsChartProps {
    data: IGroupedRegistrations<string>[];
}

export class RegistrationsPerUser extends React.Component<IRegistrationsChartProps, { data: chartjs.ChartData }> {
    private ref: React.RefObject<any>;
    private legendRef: React.RefObject<HTMLDivElement>;

    constructor(props: IRegistrationsChartProps) {
        super(props);
        this.state = { data: { datasets: [] } };

        const { data, getLabels } = this.props;

        this.ref = React.createRef();
        this.legendRef = React.createRef();

        getLabels().then(labels => {
            const sortedData = data.sort((a, b) => a.totalTime > b.totalTime ? -1 : a.totalTime < b.totalTime ? 1 : 0);
            this.setState({
                ...this.state, ...{
                    data: {
                        datasets: [
                            {
                                data: sortedData.map(d => d.totalTime),
                                backgroundColor: chartColorsArray
                            }
                        ],
                        labels: data.map(d => labels[d.groupKey])
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