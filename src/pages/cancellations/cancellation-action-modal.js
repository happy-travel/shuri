import React from 'react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import Modal from 'parts/modal';
import { CachedForm, FieldSelect, FieldText } from 'matsumoto/src/components/form';
import { getSelectOptions } from 'utils/ui-utils';

const PENALTY_TYPE_OPTIONS = ['Percent', 'Nights'];

class CancellationActionModal extends React.Component {
    penaltyTypeOptions;
    disabled = Boolean(this.props.cancellation);

    constructor(props) {
        super(props);
        this.penaltyTypeOptions = getSelectOptions(PENALTY_TYPE_OPTIONS, props.t);
    }

    renderForm = (formik) => {
        const { t } = this.props;
        const buttonTitle = this.props.cancellation ? t('Remove') : t('Create');

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
                        id="seasonId"
                        label={t('Season')}
                        options={this.props.seasonsOptions}
                        required
                    />
                </div>
                <div className="row">
                    <FieldSelect
                        formik={formik}
                        disabled={this.disabled}
                        addClass="size-half"
                        id="penaltyType"
                        label={t('Penalty type')}
                        options={this.penaltyTypeOptions}
                        required
                    />
                    <FieldText
                        formik={formik}
                        disabled={this.disabled}
                        addClass="size-half"
                        id="penaltyCharge"
                        numeric
                        label={t('Penalty charge')}
                        required
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        disabled={this.disabled}
                        addClass="size-half"
                        clearable
                        id="daysPriorToArrival.fromDay"
                        numeric
                        label={t('From day')}
                        required
                    />
                    <FieldText
                        formik={formik}
                        disabled={this.disabled}
                        addClass="size-half"
                        clearable
                        id="daysPriorToArrival.toDay"
                        numeric
                        label={t('To day')}
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
                                {buttonTitle}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { t, cancellation } = this.props;
        const initialValues = cancellation ?
            {
                roomId: cancellation.roomId,
                seasonId: cancellation.seasonId,
                ...cancellation.policies[this.props.policyIndex]
            } :
            this.props.cancellationStub;
        const modalTitle = cancellation ? t('Cancellation remove') : t('Cancellation creation');

        return (
            <Modal
                onCloseClick={this.props.onClose}
                title={modalTitle}
            >
                <div className="rate-create-modal-content">
                    <CachedForm
                        initialValues={initialValues}
                        onSubmit={this.props.action}
                        render={this.renderForm}
                        enableReinitialize
                    />
                </div>
            </Modal>
        );
    }
}

CancellationActionModal.propTypes = {
    t: propTypes.func,
    cancellation: propTypes.object,
    policyIndex: propTypes.number,
    cancellationStub: propTypes.object,
    roomsOptions: propTypes.array,
    seasonsOptions: propTypes.array,
    onClose: propTypes.func,
    action: propTypes.func
}

export default withTranslation()(CancellationActionModal);
