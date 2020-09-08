import React from 'react';
import { getIn } from 'formik';
import { observer } from 'mobx-react';
import { Range, getTrackBackground } from 'react-range';
import propTypes from 'prop-types';

@observer
class FieldMultiRange extends React.Component {
    changing = (values) => {
        const { formik, ids } = this.props;
        values.map((value, index) => {
            formik.setFieldValue(ids[index], value);
        });
    }

    componentDidUpdate() {
        const {
            min,
            max,
            formik,
            ids
        } = this.props;

        const result = ids.map((id) => getIn(formik.values, id));
        for (let i = 0; i < result.length; i++) {
            if (result[i] === null || result[i] === undefined) {
                if (i === 0) {
                    result[i] = min;
                }
                else if (i === result.length - 1) {
                    result[i] = max;
                }
                else {
                    result[i] = Math.trunc(((result[i-1] || min) + (result[i+1] || max))/2);
                }
                formik.setFieldValue(ids[i], result[i]);
            }
        }
        return result;
    }

    render() {
        const {
            min,
            max,
            colors,
            formik,
            ids
        } = this.props;

        let values = ids.map((id) => getIn(formik.values, id));

        return (
            <>
            <div className="multi-range">
                <Range
                    step={1}
                    min={min}
                    max={max}
                    values={values}
                    onChange={this.changing}
                    renderTrack={({ props, children }) => (
                        <div
                            {...props}
                            style={{
                                ...props.style,
                                height: '8px',
                                width: '100%',
                                background: getTrackBackground({
                                    values: values,
                                    colors: colors,
                                    min,
                                    max
                                })
                            }}
                        >
                            {children}
                        </div>
                    )}
                    renderThumb={({ props }) => (
                        <div
                            {...props}
                            className="input-range__slider"
                        />
                    )}
                />
            </div>
            </>
        );
    }
}

FieldMultiRange.propTypes = {
    formik: propTypes.object,
    min: propTypes.number,
    max: propTypes.number,
    ids: propTypes.array,
    colors: propTypes.array
};

export default FieldMultiRange;
