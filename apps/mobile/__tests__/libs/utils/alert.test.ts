import { Alert } from 'react-native';
import { showSuccessAlert, showErrorAlert } from '../../../libs/utils/alert';

// Mock do Alert nativo
jest.spyOn(Alert, 'alert');

describe('Libs: Utils - Alert', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('showSuccessAlert deve chamar o Alert.alert nativo corretamente', () => {
    const title = 'Sucesso';
    const message = 'Operação realizada!';

    showSuccessAlert(title, message);

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(Alert.alert).toHaveBeenCalledWith(title, message);
  });

  it('showErrorAlert deve chamar o Alert.alert nativo corretamente', () => {
    const title = 'Erro';
    const message = 'Algo deu errado.';

    showErrorAlert(title, message);

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(Alert.alert).toHaveBeenCalledWith(title, message);
  });
});