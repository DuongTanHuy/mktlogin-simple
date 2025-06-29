import { Stack, Typography } from "@mui/material";
import PropTypes from "prop-types";

const CustomLabel = ({ children, nameLabel }) => (
  <Stack direction="column" gap={1} sx={{ mb: 1 }}>
    <Typography variant="body2">{nameLabel}</Typography>
    {children}
  </Stack>
)

CustomLabel.propTypes = {
  children: PropTypes.node,
  nameLabel: PropTypes.string
}

export default CustomLabel;
