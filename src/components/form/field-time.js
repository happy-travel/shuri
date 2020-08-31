import React from 'react';
import propTypes from 'prop-types';
import { observer } from 'mobx-react';
import View from 'matsumoto/src/stores/view-store';
import FieldText from 'matsumoto/src/components/form/field-text';

const TIME_OPTIONS = [
    { value: '00:00', text: '00:00' },
    { value: '00:30', text: '00:30' },
    { value: '01:00', text: '01:00' },
    { value: '01:30', text: '01:30' },
    { value: '02:00', text: '02:00' },
    { value: '02:30', text: '02:30' },
    { value: '03:00', text: '03:00' },
    { value: '03:30', text: '03:30' },
    { value: '04:00', text: '04:00' },
    { value: '04:30', text: '04:30' },
    { value: '05:00', text: '05:00' },
    { value: '05:30', text: '05:30' },
    { value: '06:00', text: '06:00' },
    { value: '06:30', text: '06:30' },
    { value: '07:00', text: '07:00' },
    { value: '07:30', text: '07:30' },
    { value: '08:30', text: '08:30' },
    { value: '09:00', text: '09:00' },
    { value: '09:30', text: '09:30' },
    { value: '10:00', text: '10:00' },
    { value: '10:30', text: '10:30' },
    { value: '11:00', text: '11:00' },
    { value: '11:30', text: '11:30' },
    { value: '12:00', text: '12:00' },
    { value: '12:30', text: '12:30' },
    { value: '13:00', text: '13:00' },
    { value: '13:30', text: '13:30' },
    { value: '14:00', text: '14:00' },
    { value: '14:30', text: '14:30' },
    { value: '15:00', text: '15:00' },
    { value: '15:30', text: '15:30' },
    { value: '16:00', text: '16:00' },
    { value: '16:30', text: '16:30' },
    { value: '17:00', text: '17:00' },
    { value: '17:30', text: '17:30' },
    { value: '18:00', text: '18:00' },
    { value: '18:30', text: '18:30' },
    { value: '19:00', text: '19:00' },
    { value: '19:30', text: '19:30' },
    { value: '20:00', text: '20:00' },
    { value: '20:30', text: '20:30' },
    { value: '21:00', text: '21:00' },
    { value: '21:30', text: '21:30' },
    { value: '22:00', text: '22:00' },
    { value: '22:30', text: '22:30' },
    { value: '23:00', text: '23:00' },
    { value: '23:30', text: '23:30' }
];
const TIME_REGEXP = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

@observer
class SelectDropdown extends React.Component {
    setValue = (item) => {
        const { formik } = this.props;
        const { value } = item;
        if (!formik) {
            return;
        }

        formik.setFieldValue(this.props.connected, value);
        this.props.setValue(value);
        View.setOpenDropdown(null);
    }

    render() {
        const { options } = this.props;

        return (
            <div className="dropdown select">
                {options?.map((item) => (
                    <div key={item.value} className="item line" onClick={ () => this.setValue(item) }>
                        {item.text}
                    </div>
                ))}
            </div>
        );
    }
}

@observer
class FieldTime extends React.Component {
    lastCorrectValue;

    setLastCorrectValue = (value) => {
        if (TIME_REGEXP.test(value)) {
            this.lastCorrectValue = value;
        }
    }

    onBlur = (event) => {
        event.target.value = this.lastCorrectValue || '';
    }

    onChange = (event) => {
        const previousValue = this.props.formik.values[this.props.id];
        const { value } = event.target;
        if (previousValue?.length === 1) {
            event.target.value = value.replace(/^\d\d$/, '$&:');
        }
        this.setLastCorrectValue(previousValue);
        this.setLastCorrectValue(value);
        View.setOpenDropdown(null);
    }

    onDropdownClick = (value) => {
        this.setLastCorrectValue(value);
    }

    render() {
        return (
            <FieldText
                {...this.props}
                setValue={this.onDropdownClick}
                onBlur={this.onBlur}
                onChange={this.onChange}
                maxLength={5}
                options={TIME_OPTIONS}
                Dropdown={SelectDropdown}
            />
        );
    }
}

SelectDropdown.propTypes = {
    options: propTypes.array,
    formik: propTypes.object,
    connected: propTypes.string,
    setValue: propTypes.func
};

FieldTime.propTypes = {
    formik: propTypes.object,
    id: propTypes.string
};

export default FieldTime;
