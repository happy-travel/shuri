import React from 'react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { CachedForm, FieldSelect, FieldText, FieldTextarea } from 'matsumoto/src/components/form';
import UI from 'stores/shuri-ui-store';
import Modal from 'parts/modal';

class RateCreateModal extends React.Component {
    boardBasisOptions;
    roomTypeOptions;
    rate = {
        currency: 'USD'
    };

    constructor(props) {
        super(props);
        const { t } = props;
        this.boardBasisOptions = [
            {
                value: 'notSpecified',
                text: t('notSpecified')
            },
            {
                value: 'roomOnly',
                text: t('roomOnly')
            },
            {
                value: 'selfCatering',
                text: t('selfCatering')
            },
            {
                value: 'bedAndBreakfast',
                text: t('bedAndBreakfast')
            },
            {
                value: 'halfBoard',
                text: t('halfBoard')
            },
            {
                value: 'fullBoard',
                text: t('fullBoard')
            },
            {
                value: 'allInclusive',
                text: t('allInclusive')
            }
        ];
        this.roomTypeOptions = [
            {
                value: 'notSpecified',
                text: t('notSpecified')
            },
            {
                value: 'single',
                text: t('single')
            },
            {
                value: 'twinOrSingle',
                text: t('twinOrSingle')
            },
            {
                value: 'twin',
                text: t('twin')
            },
            {
                value: 'double',
                text: t('double')
            },
            {
                value: 'triple',
                text: t('triple')
            },
            {
                value: 'quadruple',
                text: t('quadruple')
            },
            {
                value: 'family',
                text: t('family')
            }
        ];
    }

    renderForm = (formik) => {
        const { t } = this.props;

        return (
            <div className="form app-settings">
                <div className="row">
                    <FieldSelect
                        formik={formik}
                        addClass="size-half"
                        id="roomId"
                        label={t('Room')}
                        options={this.props.roomsOptions}
                        required
                    />
                    <FieldSelect
                        formik={formik}
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
                        addClass="size-half"
                        id="boardBasis"
                        label={t('Board Basis')}
                        options={this.boardBasisOptions}
                        required
                    />
                    <FieldSelect
                        formik={formik}
                        addClass="size-half"
                        id="roomType"
                        label={t('Room type')}
                        options={this.roomTypeOptions}
                        required
                    />
                </div>
                <div className="row">
                    <FieldText
                        formik={formik}
                        addClass="size-half"
                        clearable
                        id="price"
                        label={t('Price')}
                        placeholder={t('Enter rate price')}
                        required
                    />
                    <FieldText
                        formik={formik}
                        addClass="size-half"
                        clearable
                        id="mealPlan"
                        label={t('Meal Plan')}
                        placeholder={t('Describe meal plan')}
                        required
                    />
                </div>
                <div className="row">
                    <FieldTextarea
                        formik={formik}
                        clearable
                        id={`details.${UI.editorLanguage}`}
                        label={t('Details')}
                        placeholder={t('Enter details on this rate')}
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
