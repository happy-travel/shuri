import React from 'react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { CachedForm, FieldSelect, FieldText } from 'matsumoto/src/components/form';
import UI from 'stores/shuri-ui-store';
import Modal from 'parts/modal';

const BOARD_BASIS_OPTIONS = [
    {
        value: 'notSpecified',
        text: 'Not specified'
    },
    {
        value: 'roomOnly',
        text: 'Room only'
    },
    {
        value: 'selfCatering',
        text: 'Self catering'
    },
    {
        value: 'bedAndBreakfast',
        text: 'Bed and breakfast'
    },
    {
        value: 'halfBoard',
        text: 'Half board'
    },
    {
        value: 'fullBoard',
        text: 'Full board'
    },
    {
        value: 'allInclusive',
        text: 'All inclusive'
    }
];

class RateCreateModal extends React.Component {
    rate = {
        currency: 'USD',
        roomType: 'notSpecified',
        details: { [UI.editorLanguage]: '' }
    };

    renderForm = (formik) => {
        const { t } = this.props;

        return (
            <div className="form app-settings">
                <div className="row">
                    <FieldSelect
                        formik={formik}
                        id="roomId"
                        label={t('Room')}
                        options={this.props.roomsOptions}
                        required
                    />

                </div>
                <div className="row">
                    <FieldSelect
                        formik={formik}
                        id="seasonId"
                        label={t('Season')}
                        options={this.props.seasonsOptions}
                        required
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id="price"
                        label={t('Price')}
                        placeholder={t('Enter rate price')}
                        required
                    />
                </div>
                <div className="row">
                    <FieldSelect
                        formik={formik}
                        id="boardBasis"
                        label={t('Board Basis')}
                        options={BOARD_BASIS_OPTIONS}
                        required
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id="mealPlan"
                        label={t('Meal Plan')}
                        placeholder={t('Describe meal plan')}
                        required
                    />
                </div>
                <div className="row controls modal-actions">
                    <div className="field">
                        <div className="inner">
                            <button
                                type="submit"
                                className="button"
                            >
                                {t('Create')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { t } = this.props;

        return (
            <Modal
                onCloseClick={this.props.onClose}
                title={t('Season rate creation')}
            >
                <div className="rate-create-modal-content">
                    <CachedForm
                        initialValues={this.rate}
                        onSubmit={this.props.onCreate}
                        render={this.renderForm}
                        enableReinitialize
                    />
                </div>
            </Modal>
        );
    }
}

RateCreateModal.propTypes = {
    t: propTypes.func,
    roomsOptions: propTypes.array,
    seasonsOptions: propTypes.array,
    onClose: propTypes.func,
    onCreate: propTypes.func
};

export default withTranslation()(RateCreateModal);
