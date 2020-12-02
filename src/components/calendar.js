import React from 'react';
import { observable } from 'mobx';
import { withTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import FieldSelect from 'matsumoto/src/components/form/field-select';
import propTypes from 'prop-types';

const DAY_OF_WEEK_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];

// temporary const, will be settable later
const FIRST_DAY_OF_WEEK = 1;
const DAYS_IN_MONTH = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const COMMON_VALUE_ID = 'common-value';
const CHANGED_POSTFIX = '-changed';

@observer
class CalendarForm extends React.Component {
    @observable selected = [];
    @observable everChanged = false;

    componentDidMount() {
        const { startDate, formik } = this.props;
        let date = new Date(startDate);
        date.setDate(1);
        formik.setFieldValue('month', Number(date));
    }

    clearSelected = () => {
        this.selected = [];
    }

    setValues = (value, formik) => {
        this.selected.forEach((selectedDay) => {
            formik.setFieldValue(selectedDay, value);
            formik.setFieldValue(selectedDay+CHANGED_POSTFIX, true);
        });
        this.clearSelected();
        this.everChanged = true;
    }

    dayClick = (event, formik, value) => {
        if (!this.selected?.length) {
            const { formik } = this.props;
            this.selected = [value];
            formik.setFieldValue(COMMON_VALUE_ID, undefined);
            return;
        }
        if (!this.selected.includes('filled')) {
            let start = Math.min(this.selected[0], value);
            let end = Math.max(this.selected[0], value);
            for (
                let date = new Date(start);
                date <= new Date(end);
                date.setDate(date.getDate()+1)
            ) {
                this.selected.push(Number(date));
            }
            this.selected.push('filled');
            return;
        }
        if (this.selected.includes(value)) {
            this.selected.splice(this.selected.indexOf(value), 1);
            return;
        }
        this.selected.push(value);
    }

    renderDay = (firstDay, plusDay) => {
        const { startDate, endDate } = this.props;
        const { formik, possibleValues } = this.props;
        const day = new Date(firstDay);
        day.setDate(day.getDate() + plusDay - firstDay.getDay());

        if ((plusDay < firstDay.getDay()) ||
            (plusDay > DAYS_IN_MONTH(firstDay) + firstDay.getDay() - 1)) {
            return null;
        }
        if ((day < new Date(startDate) || (day > new Date(endDate)))) {
            return null;
        }

        const id = Number(day);
        return (
            <td
                className={
                    'cell ' +
                    'value-' + formik.values[String(id)] +
                    __class(formik.values[id+CHANGED_POSTFIX], 'changed') +
                    __class(this.selected.includes(id), 'selected')
                }
                onClick={(e) => this.dayClick(e, formik, id)}
            >
                <div className="cell-container">
                    <strong>{day.getDate()}</strong>
                    <div className="value">
                        {possibleValues[formik.values[String(id)]]}
                    </div>
                </div>
            </td>
        );
    }

    renderWeek = (firstDay, plusWeek) => {
        const days = [];
        for (let plusDay = FIRST_DAY_OF_WEEK; plusDay < 7 + FIRST_DAY_OF_WEEK; plusDay++) {
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
                <table>
                    <tr>
                        {DAY_OF_WEEK_NAMES
                            .map((day, index) => (<th key={index}>
                                {DAY_OF_WEEK_NAMES[(index + FIRST_DAY_OF_WEEK) % 7]}
                            </th>))
                        }
                    </tr>
                    {weeks}
                </table>
            </div>
        );
    }

    renderCalendar = (startDate) => {
        const months = [];
        let date = new Date(startDate);
        date.setDate(1);
        for (
            date;
            new Date(startDate).getUTCMonth() === date.getUTCMonth();
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

    renderMonthSelector = () => {
        const { t, formik } = this.props;
        const { startDate, endDate } = this.props;
        const options = [];

        let date = new Date(startDate);
        date.setDate(1);
        for (
            date;
            date < new Date(endDate);
            date.setMonth(date.getMonth()+1)
        ) {
            options.push({
                value: Number(date),
                text: MONTH_NAMES[date.getMonth()] + ' ' + date.getFullYear()
            });
        }

        return (
            <FieldSelect
                formik={formik}
                label={t('Month')}
                id="month"
                options={options}
            />
        )
    }

    render() {
        const { t, formik, possibleValues } = this.props;

        return (
            <div className="calendar">
                <div className="top-controls">
                    <div>
                        {this.renderMonthSelector()}
                    </div>
                    {Boolean(this.selected?.length) &&
                        <div className="clear-wrapper">
                            <button type="button" className="button-clear" onClick={this.clearSelected}>
                                {t('Clear selection')}
                            </button>
                        </div>
                    }
                </div>
                <div className="main-section">
                    {this.renderCalendar(formik.values.month)}
                    <div className="right-controls">
                        {Boolean(this.selected?.length) &&
                            <FieldSelect
                                formik={formik}
                                label={t('Choose value for all selected days')}
                                id="common-value"
                                setValue={(value) => this.setValues(value, formik)}
                                options={Object.keys(possibleValues).map((key) => ({
                                    value: key,
                                    text: possibleValues[key]
                                }))}
                            />
                        }
                        {this.everChanged &&
                            <div className="">
                                <div className="field">
                                    <div className="inner">
                                        <button
                                            type="submit"
                                            className="button"
                                        >
                                            {t('Save changes')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

CalendarForm.propTypes = {
    t: propTypes.func,
    formik: propTypes.object,
    possibleValues: propTypes.object,
    startDate: propTypes.string,
    endDate: propTypes.string
};

export default withTranslation()(CalendarForm);
