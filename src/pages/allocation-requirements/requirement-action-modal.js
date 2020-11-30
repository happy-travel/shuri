import React from 'react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { CachedForm, FieldSelect, FieldText } from 'matsumoto/src/components/form';
import Modal from 'parts/modal';

class RequirementActionModal extends React.Component {
    disabled = Boolean(this.props.requirement);

    renderForm = (formik) => {
        const { t } = this.props;
        const buttonTitle = this.props.requirement ? t('Remove') : t('Create');

        return (
            <div className="form app-settings">
                <div className="row">
                    <FieldSelect
                        formik={formik}
                        disabled
                        addClass="size-half"
                        id="roomId"
                        label={t('Room')}
                        options={this.props.roomsOptions}
                        required
                    />
                    <FieldSelect
                        formik={formik}
                        disabled
                        addClass="size-half"
                        id="seasonRangeId"
                        label={t('Season range')}
                        options={this.props.seasonsRangesOptions}
                        required
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        disabled={this.disabled}
                        addClass="size-half"
                        id="releaseDays"
                        numeric
                        label={t('Release days')}
                        required
                    />
                    <FieldText
                        formik={formik}
                        disabled={this.disabled}
                        addClass="size-half"
                        id="allotment"
                        numeric
                        label={t('Allotment')}
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        disabled={this.disabled}
                        id="minimumLengthOfStay"
                        numeric
                        label={t('Minimum length of stay')}
                    />
                </div>
                <div className="row controls modal-actions">
                    <div className="field">
                        <div className="inner">
                            <button
                                type="submit"
                                className="button"
                            >
                                {buttonTitle}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { t, requirement } = this.props;
        const modalTitle = requirement ? t('Requirement') : t('Requirement creation');

        return (
            <Modal
                onCloseClick={this.props.onClose}
                title={modalTitle}
            >
                <div className="rate-create-modal-content">
                    <CachedForm
                        initialValues={requirement || this.props.requirementStub}
                        onSubmit={this.props.action}
                        render={this.renderForm}
                        enableReinitialize
                    />
                </div>
            </Modal>
        );
    }
}

RequirementActionModal.propTypes = {
    t: propTypes.func,
    requirement: propTypes.object,
    requirementStub: propTypes.object,
    roomsOptions: propTypes.array,
    seasonsRangesOptions: propTypes.array,
    onClose: propTypes.func,
    action: propTypes.func
}

export default withTranslation()(RequirementActionModal);
