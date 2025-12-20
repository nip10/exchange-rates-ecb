import { describe, it, expect } from 'vitest';
import parse from '../lib/parser';

describe('XML Security', () => {
  it('should handle malformed XML gracefully', () => {
    const invalidXml = '<invalid>unclosed';
    expect(() => parse(invalidXml)).toThrow('Failed to parse exchange rate XML');
  });

  it('should validate XML structure - missing Envelope', () => {
    const missingEnvelope = `<?xml version="1.0"?>
      <Root>
        <SomeTag>data</SomeTag>
      </Root>`;

    expect(() => parse(missingEnvelope)).toThrow('Invalid ECB XML structure');
  });

  it('should validate XML structure - missing Cube', () => {
    const missingCube = `<?xml version="1.0"?>
      <gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01">
        <gesmes:subject>Reference rates</gesmes:subject>
      </gesmes:Envelope>`;

    expect(() => parse(missingCube)).toThrow('Invalid ECB XML structure');
  });

  it('should handle invalid date formats', () => {
    const invalidDate = `<?xml version="1.0"?>
      <gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01">
        <Cube>
          <Cube time="invalid-date-format">
            <Cube currency="USD" rate="1.0945"/>
          </Cube>
        </Cube>
      </gesmes:Envelope>`;

    expect(() => parse(invalidDate)).toThrow('Invalid date in ECB data');
  });

  it('should handle invalid Cube structure (not an array)', () => {
    const invalidStructure = `<?xml version="1.0"?>
      <gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01">
        <Cube>
          <Cube time="2024-01-15">
            Invalid
          </Cube>
        </Cube>
      </gesmes:Envelope>`;

    expect(() => parse(invalidStructure)).toThrow('Cube entries must be an array');
  });

  it('should handle empty XML', () => {
    const emptyXml = '';
    expect(() => parse(emptyXml)).toThrow('Failed to parse exchange rate XML');
  });

  it('should handle XML without proper structure', () => {
    const noStructure = `<?xml version="1.0"?>
      <gesmes:Envelope>
        <Cube>Invalid Structure</Cube>
      </gesmes:Envelope>`;

    expect(() => parse(noStructure)).toThrow();
  });
});

describe('Input Validation', () => {
  it('should parse valid ECB XML successfully', () => {
    const validXml = `<?xml version="1.0"?>
      <gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01">
        <Cube>
          <Cube time="2024-01-15">
            <Cube currency="USD" rate="1.0945"/>
            <Cube currency="GBP" rate="0.8573"/>
          </Cube>
        </Cube>
      </gesmes:Envelope>`;

    const result = parse(validXml);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBeInstanceOf(Date);
    expect(result[0].rates.USD).toBe(1.0945);
    expect(result[0].rates.GBP).toBe(0.8573);
  });
});
