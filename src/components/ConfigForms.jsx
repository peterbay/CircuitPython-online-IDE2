import PropTypes from "prop-types";
import snakeCase from "lodash/snakeCase";
import { useState } from "react";
import {
    Box,
    Tab,
    Tabs,
} from "@mui/material";
import TabPanel from "./TabPanel";
import SchemaForm from "./SchemaForm";

export default function ConfigForms({ schemas, config, setConfig }) {
    const [tabValue, setTabValue] = useState(0);
    return (
        <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    value={tabValue}
                    onChange={(event, newValue) => {
                        setTabValue(newValue);
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {schemas.map((schema, index) => {
                        return (
                            <Tab
                                label={schema.title}
                                id={`simple-tab-${index}`}
                                aria-controls={`simple-tabpanel-${index}`}
                                key={"schema_tab_key_" + snakeCase(schema.title)}
                            />
                        );
                    })}
                </Tabs>
            </Box>
            {schemas.map((schema, index) => {
                return (
                    <TabPanel value={tabValue} index={index} key={"schema_key_" + snakeCase(schema.title)}>
                        <SchemaForm
                            initFormData={config[snakeCase(schema.title)]}
                            schema={schema}
                            onSubmit={(formData) => {
                                setConfig(snakeCase(schema.title), formData);
                            }}
                        />
                    </TabPanel>
                );
            })}
        </Box>
    );
}

ConfigForms.propTypes = {
    schemas: PropTypes.array,
    config: PropTypes.object,
    setConfig: PropTypes.func,
};
