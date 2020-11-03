import React from 'react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { CachedForm, FieldSelect, FieldText, FieldTextarea } from 'matsumoto/src/components/form';
import UI from 'stores/shuri-ui-store';
import Modal from 'parts/modal';
import { getSelectOptions } from 'utils/ui-utils';

const BOARD_BASIS_OPTIONS = [
    'NotSpecified',
    'RoomOnly',
    'SelfCatering',
    'BedAndBreakfast',
    'HalfBoard',
    'FullBoard',
    'AllInclusive'
];
const ROOM_TYPE_OPTIONS = ['NotSpecified', 'Single', 'TwinOrSingle', 'Twin', 'Double', 'Triple', 'Quadruple', 'Family'];
const DEFAULT_CURRENCY = 'USD';

class RateActionModal extends React.Component {
    boardBasisOptions;
    roomTypeOptions;
    disabled = Boolean(this.props.rate);

    constructor(props) {
        super(props);
        const { t } = props;
        this.boardBasisOptions = getSelectOptions(BOARD_BASIS_OPTIONS, t);
        this.roomTypeOptions = getSelectOptions(ROOM_TYPE_OPTIONS, t);
    }

    renderForm = (formik) => {
        const { t } = this.props;
        const buttonTitle = this.props.rate ? t('Remove') : t('Create');

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
                        id="boardBasis"
                        label={t('Board Basis')}
                        options={this.boardBasisOptions}
                        required
                    />
                    <FieldSelect
                        formik={formik}
                        disabled={this.disabled}
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
                        disabled={this.disabled}
                        addClass="size-half"
                        clearable
                        id="price"
                        numeric
                        label={t('Price')}
                        placeholder={t('Enter rate price')}
                        required
                    />
                    <FieldText
                        formik={formik}
                        disabled={this.disabled}
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
                        disabled={this.disabled}
                        clearable
                        id={`description.${UI.editorLanguage}`}
                        label={t('Description')}
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
                                {buttonTitle}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { t, rate } = this.props;
        const initialValues = rate ?
            { ...rate, boardBasis: rate.boardBasisType } :
            { ...this.props.rateStub, currency: DEFAULT_CURRENCY };
        const modalTitle = rate ? t('Season rate removing') : t('Season rate creation');

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

RateActionModal.propTypes = {
    t: propTypes.func,
    rate: propTypes.object,
    rateStub: propTypes.object,
    roomsOptions: propTypes.array,
    seasonsOptions: propTypes.array,
    onClose: propTypes.func,
    action: propTypes.func
};

export default withTranslation()(RateActionModal);
