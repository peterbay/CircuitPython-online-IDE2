import PropTypes from "prop-types";
import { useEffect, useState } from "react";

// schema form
import { Form } from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
// user data
import uiSchema from "../settings/configUiSchema.json";

export default function SchemaForm({ initFormData, schema, onSubmit }) {
    const [formData, setFormData] = useState();
    useEffect(() => {
        setFormData(initFormData);
    }, [initFormData]);

    function handleChange(e) {
        setFormData(e.formData);
    }

    function handleSubmit(e) {
        onSubmit(e.formData);
    }

    return (
        <Form
            formData={formData}
            schema={schema}
            uiSchema={uiSchema}
            validator={validator}
            onSubmit={handleSubmit}
            omitExtraData={true}
            onChange={handleChange}
        />
    );
}

SchemaForm.propTypes = {
    initFormData: PropTypes.object,
    schema: PropTypes.object,
    onSubmit: PropTypes.func,
};
