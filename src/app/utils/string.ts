export function encodeString(value: String) {
  if (!value) {
    return value;
  }

  return value.replaceAll('+', '%2B');
}

export function isValidDate (value: any ) {
  return new Date(value).toString() !== 'Invalid Date';

}
