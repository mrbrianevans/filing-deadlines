import YAML from 'yaml'
import constantsYaml from '../assets/constants.yaml?raw'

export const constants = YAML.parseDocument(constantsYaml).toJS()


