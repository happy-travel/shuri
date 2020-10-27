import React from 'react';
import { withTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import Modal from 'parts/modal';
import ProgressLine from 'components/progress-line';
import { getSizeString } from 'utils/upload-utils';
import { VALIDATION_ERROR } from 'utils/error-utils';

@observer
class UploadModal extends React.Component {
    componentDidMount() {
        this.props.uploadFiles();
    }

    onCloseClick = () => {
        const confirmText = this.props.t(
            'If you close this window, the data will be lost. Are you sure you want to continue?'
        );

        if (this.props.uploadManager.isResolved || window.confirm(confirmText)) {
            this.props.onCloseClick();
        }
    }

    renderUploadingItem = (item) => {
        const { t } = this.props;
        const { status } = item;

        const statusText = status !== 'uploading' ?
            (item.error ? getErrorMessage(item.error, t) : t(status)) :
            null;

        return (
            <div className="upload-item" key={item.file.name}>
                <div className="upload-item-description">
                    <span className="upload-item-name">{item.file.name}</span>
                    <span className="upload-item-size">
                        {getSizeString(item.file.size) + ' MB'}
                    </span>
                </div>
                <div className={`upload-item-status ${status}`}>
                    {status === 'uploading' ?
                        <ProgressLine
                            done={item.loadedBytes}
                            total={item.file.size}
                        /> :
                        statusText
                    }
                </div>
            </div>
        );
    }

    render() {
        return (
            <Modal
                title={this.props.t('Files upload')}
                onCloseClick={this.onCloseClick}
            >
                <div className="upload-modal">
                    {this.props.uploadManager.items.map(this.renderUploadingItem)}
                </div>
            </Modal>
        );
    }
}

function getErrorMessage(error, translate) {
    const { data } = error;
    const errorId = data.errorId;
    return errorId === VALIDATION_ERROR ? data.details : translate(errorId);
}

UploadModal.propTypes = {
    t: propTypes.func,
    uploadManager: propTypes.object,
    uploadFiles: propTypes.func,
    onCloseClick: propTypes.func
}

export default withTranslation()(UploadModal);
