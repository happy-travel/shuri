import React from 'react';
import DateRangePicker from 'react-daterange-picker';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import View from 'matsumoto/src/stores/view-store';
import UI from 'stores/shuri-ui-store';

const STATE_DEFINITIONS = {
    available: {
        color: null,
        label: 'Available'
    },
    enquire: {
        color: '#ffd200',
        label: 'Enquire'
    },
    unavailable: {
        selectable: false,
        color: '#78818b',
        label: 'Unavailable'
    }
};

const PaginationArrowComponent = (props) => {
    const { direction } = props;
    return (
        <button
            className={`calendar-style__arrows calendar-style__arrow__${direction}`}
            onClick={(e) => {e.preventDefault(); props.onTrigger(e)}}
            disabled={props.disabled}
        >
            {direction === 'previous' ? <span>&#8249;</span> : <span>&#8250;</span>}
        </button>
    );
};

PaginationArrowComponent.propTypes = {
    direction: propTypes.string,
    disabled: propTypes.bool,
    onTrigger: propTypes.func
}

@observer
class DateDropdown extends React.Component {
    render() {
        return (
            <div className="date dropdown">
                <DateRangePicker
                    className="calendar-style width-none"
                    firstOfWeek={UI.editorLanguage === 'ar' ? 0 : 1}
                    numberOfCalendars={1}
                    selectionType="single"
                    minimumDate={this.props.connected === 'dates' ? new Date() : null}
                    stateDefinitions={STATE_DEFINITIONS}
                    defaultState="available"
                    showLegend={false}
                    paginationArrowComponent={PaginationArrowComponent}
                    value={this.props.options}
                    onSelect={
                        (...args) => {
                            this.props.setValue(...args);
                            View.setOpenDropdown(null);
                        }
                    }
                />
            </div>
        );
    }
}

DateDropdown.propTypes = {
    setValue: propTypes.func,
    connected: propTypes.string,
    options: propTypes.array
}

export default DateDropdown;
