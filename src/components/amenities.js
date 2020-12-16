import React from 'react';
import { action, observable } from 'mobx';
import { getIn } from 'formik';
import { WithContext as ReactTags } from 'react-tag-input';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import {
    getAllAmenities
} from 'providers/api';

const KeyCodes = {
    comma: 188,
    enter: 13
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

const tagMapper = (tag) => (typeof tag?.name === 'string' ? {
    id: tag.name,
    text: tag.name
} : {
    id: tag,
    text: tag
});

@observer
class AmenitiesField extends React.Component {
    @observable suggestions;

    componentDidMount() {
        getAllAmenities().then(this.getAllAmenitiesSuccess);
    }

    @action
    getAllAmenitiesSuccess = (amenities) => {
        this.suggestions = amenities.map(tagMapper);
    }

    handleDelete = (i) => {
        const {
            formik,
            id
        } = this.props;
        const values = getIn(formik.values, id);
        formik.setFieldValue(id, values.filter((tag, index) => index !== i));
    }

    handleAddition = (tag) => {
        const {
            formik,
            id
        } = this.props;
        const values = getIn(formik.values, id);
        formik.setFieldValue(id, [...values, tag.text]);
    }

    handleDrag = (tag, currPos, newPos) => {
        const {
            formik,
            id
        } = this.props;
        const values = getIn(formik.values, id);
        const newTags = values.slice();
        newTags.splice(currPos, 1);
        newTags.splice(newPos, 0, tag.text);
        formik.setFieldValue(id, newTags);
    }

    render() {
        const {
            formik,
            id,
            placeholder,
            label
        } = this.props;

        const values = (getIn(formik.values, id) || []).map(tagMapper);

        return (
            <div className="field">
                <div className="label">{label}</div>
                <ReactTags
                    tags={values}
                    suggestions={this.suggestions}
                    handleDelete={this.handleDelete}
                    handleAddition={this.handleAddition}
                    handleDrag={this.handleDrag}
                    delimiters={delimiters}
                    allowDeleteFromEmptyInput={false}
                    autofocus={false}
                    placeholder={placeholder}
                />
            </div>
        );
    }
}

AmenitiesField.propTypes = {
    formik: propTypes.object,
    id: propTypes.string,
    placeholder: propTypes.string,
    label: propTypes.string
};

export default AmenitiesField;
