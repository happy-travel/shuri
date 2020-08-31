import React from 'react';
import propTypes from 'prop-types';
import { observer } from 'mobx-react';
import View from 'matsumoto/src/stores/view-store';
import FieldText from 'matsumoto/src/components/form/field-text';

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
        const { options } = this.props;
        return (
            <FieldText
                {...this.props}
                maxLength={5}
                setValue={options ? this.onDropdownClick : undefined}
                onBlur={this.onBlur}
                onChange={this.onChange}
                Dropdown={options ? SelectDropdown : undefined}
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
    options: propTypes.array,
    formik: propTypes.object,
    id: propTypes.string
};

export default FieldTime;
