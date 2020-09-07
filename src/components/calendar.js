import React from 'react';
import { observable } from 'mobx';
import { withTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import FieldSelect from 'matsumoto/src/components/form/field-select';
import propTypes from 'prop-types';

const dayOfWeekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const firstDayOfWeek = 1;

@observer
class CalendarForm extends React.Component {
    @observable contract;
    @observable ranges;
    contractId = 0;

    renderDay = (firstDay, plusDay) => {
        const {
            formik,
            seasons
        } = this.props;
        const day = new Date(firstDay);
        day.setDate(day.getDate() + plusDay - firstDay.getDay());

        // TODO : отсечение по верхней границе и отсечение по нижней границе
        if ((plusDay < firstDay.getDay()) ||
            (plusDay > daysInMonth(firstDay) + firstDay.getDay() - 1)) {
            return null;
        }

        return (
            <td>
                {day.getDate()}<br/>

                <FieldSelect
                    formik={formik}
                    id={String(Number(day))}
                    options={Object.keys(seasons).map((key) => ({
                        value: key,
                        text: seasons[key]
                    }))}
                />
            </td>
        );
    }

    renderWeek = (firstDay, plusWeek) => {
        const days = [];
        for (let plusDay = firstDayOfWeek; plusDay < 7 + firstDayOfWeek; plusDay++) {
            let day = this.renderDay(firstDay, plusWeek*7 + plusDay);
            days.push(day);
        }
        return days.some((i) => i) && (
            <tr>
                {days.map((i) => (i || <td />))}
            </tr>
        );
    }

    renderMonth = (date) => {
        const weeks = [];
        for (let plusWeek = -1; plusWeek < 6; plusWeek++) {
            let week = this.renderWeek(date, plusWeek);
            if (week) {
                weeks.push(week);
            }
        }
        return (
            <div className="month">
                <h2>
                    <span className="brand">
                        {monthNames[date.getMonth()]} {date.getFullYear()}
                    </span>
                </h2>
                <table>
                    <tr>
                        {dayOfWeekNames
                            .map((day, index) => (<th key={index}>
                                {dayOfWeekNames[(index + firstDayOfWeek) % 7]}
                            </th>))
                        }
                    </tr>
                    {weeks}
                </table>
            </div>
        );
    }

    renderCalendar = (startDate, endDate) => {
        const months = [];
        for (
            let date = new Date(startDate);
            date < new Date(endDate);
            date.setMonth(date.getMonth()+1)
        ) {
            months.push(this.renderMonth(date));
        }
        return (
            <>
                {months}
            </>
        )
    }

    render() {
        const { startDate, endDate } = this.props;

        return (
            <div className="calendar">
                {this.renderCalendar(startDate, endDate)}
            </div>
        );
    }
}

CalendarForm.propTypes = {
    formik: propTypes.object,
    seasons: propTypes.object,
    startDate: propTypes.string,
    endDate: propTypes.string
};

export default withTranslation()(CalendarForm);
