import snakeCase from "lodash/snakeCase";
import { useState, useContext } from "react";
import {
    Box,
    Tab,
    Tabs,
} from "@mui/material";
import TabPanel from "./TabPanel";
import SchemaForm from "./SchemaForm";
import IdeContext from "../contexts/IdeContext";

export default function ConfigForms() {

    const { configApi } = useContext(IdeContext);

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
                    {configApi.schemas.map((schema, index) => {
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
            {configApi.schemas.map((schema, index) => {
                return (
                    <TabPanel
                        value={tabValue}
                        index={index}
                        key={"schema_key_" + snakeCase(schema.title)}
                        className="config-form-tab"
                    >
                        <SchemaForm
                            initFormData={configApi.config[snakeCase(schema.title)]}
                            schema={schema}
                            onSubmit={(formData) => {
                                configApi.setConfig(snakeCase(schema.title), formData);
                            }}
                        />
                    </TabPanel>
                );
            })}
        </Box>
    );
}
