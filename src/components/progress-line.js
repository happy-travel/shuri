import React from 'react';
import propTypes from 'prop-types';

const ProgressLine = (props) => (
    <div className="progress-line">
        <div
            className="line"
            style={{ width: `${props.done / props.total * 100}%` }}
        />
    </div>
);

ProgressLine.propTypes = {
    done: propTypes.number,
    total: propTypes.number
}

export default ProgressLine;
