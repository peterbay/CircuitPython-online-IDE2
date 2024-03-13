import PropTypes from "prop-types";

export default function ApplyDrop({ children, onDropHandler }) {
    return (
        <div
            onDrop={onDropHandler}
            onDragOver={(event) => {
                event.preventDefault(); // to allow drop
            }}
        >
            {children}
        </div>
    );
}

ApplyDrop.propTypes = {
    children: PropTypes.object,
    onDropHandler: PropTypes.func,
};
