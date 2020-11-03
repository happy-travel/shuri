import React from 'react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { CachedForm, FieldSelect, FieldText, FieldTextarea } from 'matsumoto/src/components/form';
import FieldDatepicker from 'matsumoto/src/components/complex/field-datepicker';
import FieldDatepickerSingle from 'components/field-datepicker/field-datepicker';
import Modal from 'parts/modal';
import UI from 'stores/shuri-ui-store';

class OfferActionModal extends React.Component {
    disabled = Boolean(this.props.offer);

    renderForm = (formik) => {
        const { t } = this.props;
        const buttonTitle = this.props.offer ? t('Remove') : t('Create');

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
                    <FieldDatepicker
                        formik={formik}
                        disabled={this.disabled}
                        addClass="size-half"
                        label={t('Validity dates')}
                        id="validityDates"
                        first="validFrom"
                        second="validTo"
                        placeholder={t('Choose date')}
                        required
                    />
                </div>
                <div className="row">
                    <FieldDatepickerSingle
                        formik={formik}
                        disabled={this.disabled}
                        addClass="size-half"
                        label={t('Book by')}
                        id="bookBy"
                        date="bookBy"
                        placeholder={t('Choose date')}
                        required
                    />
                    <FieldText
                        formik={formik}
                        disabled={this.disabled}
                        addClass="size-half"
                        id="discountPercent"
                        numeric
                        label={t('Discount percent')}
                        required
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        disabled={this.disabled}
                        id="bookingCode"
                        label={t('Booking code')}
                        required
                    />
                </div>
                <div className="row">
                    <FieldTextarea
                        formik={formik}
                        disabled={this.disabled}
                        clearable
                        id={`description.${UI.editorLanguage}`}
                        label={t('Description')}
                        placeholder={t('Enter remarks')}
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
        const { t, offer } = this.props;
        const modalTitle = offer ? t('Promo offer remove') : t('Promo offer creation');

        return (
            <Modal
                onCloseClick={this.props.onClose}
                title={modalTitle}
            >
                <div className="rate-create-modal-content">
                    <CachedForm
                        initialValues={offer || this.props.offerStub}
                        onSubmit={this.props.action}
                        render={this.renderForm}
                        enableReinitialize
                    />
                </div>
            </Modal>
        );
    }
}

OfferActionModal.propTypes = {
    t: propTypes.func,
    offer: propTypes.object,
    offerStub: propTypes.object,
    roomsOptions: propTypes.array,
    onClose: propTypes.func,
    action: propTypes.func
}

export default withTranslation()(OfferActionModal);
