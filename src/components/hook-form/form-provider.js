import PropTypes from 'prop-types';
import { FormProvider as Form } from 'react-hook-form';

// ----------------------------------------------------------------------

export default function FormProvider({ children, onSubmit, methods, keyForm, sx }) {
  return (
    <Form {...methods}>
      <form key={keyForm} onSubmit={onSubmit} style={sx}>
        {children}
      </form>
    </Form>
  );
}

FormProvider.propTypes = {
  children: PropTypes.node,
  methods: PropTypes.object,
  sx: PropTypes.object,
  onSubmit: PropTypes.func,
  keyForm: PropTypes.string,
};
