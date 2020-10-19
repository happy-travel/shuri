import React from 'react';
import moment from 'moment';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import { FieldText } from 'matsumoto/src/components/form';
import DateDropdown from './dropdown-datepicker';
import { formatDateToString } from 'utils/date-utils';

@observer
class FieldDatepicker extends React.Component {
    setValue = (date) => {
        const { onChange } = this.props;
        this.props.formik.setFieldValue(this.props.date, date);
        if (onChange) {
            onChange();
        }
    }

    render() {
        const { formik } = this.props;
        const date = formik.values[this.props.date];

        return (
            <FieldText
                formik={formik}
                disabled={this.props.disabled}
                id={this.props.id}
                label={this.props.label}
                placeholder={this.props.placeholder}
                Icon={<span className="icon icon-calendar"/>}
                addClass="size-medium"
                Dropdown={DateDropdown}
                value={date ? formatDateToString(date) : ''}
                setValue={this.setValue}
                options={moment(date)}
            />
        );
    }
}

FieldDatepicker.propTypes = {
    formik: propTypes.object,
    date: propTypes.string,
    id: propTypes.string,
    label: propTypes.string,
    placeholder: propTypes.string,
    disabled: propTypes.bool,
    onChange: propTypes.func
};

export default FieldDatepicker;
