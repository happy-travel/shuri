import React from 'react';
import { withTranslation } from 'react-i18next';
import { observable } from 'mobx';
import propTypes from 'prop-types';
import { CachedForm, FieldText } from 'matsumoto/src/components/form';
import Modal from 'parts/modal';

class SeasonCreateModal extends React.Component {
    @observable season = {};

    renderForm = (formik) => {
        const { t } = this.props;

        return (
            <div className="form app-settings">
                <div className="row">
                    <FieldText
                        formik={formik}
                        clearable
                        id="seasonName"
                        label={t('Season Name')}
                        placeholder={t('Enter Season Name')}
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
                onCloseClick={this.props.onCloseClick}
                title={t('Season creation')}
            >
                <div className="modal-content">
                    <CachedForm
                        initialValues={this.season}
                        onSubmit={this.props.onCreateClick}
                        render={this.renderForm}
                        enableReinitialize
                    />
                </div>
            </Modal>
        );
    }
}

SeasonCreateModal.propTypes = {
    t: propTypes.func,
    onCloseClick: propTypes.func,
    onCreateClick: propTypes.func
};

export default withTranslation()(SeasonCreateModal);
