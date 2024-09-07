import { decodeAbiParameters, encodeAbiParameters } from 'viem';

import queryString from 'query-string';
import { DataLocationOnChain, SchemaItem } from '../types';

export function request(url: string, options?: RequestInit) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors' as RequestMode,
  };

  const requestOptions = {
    ...defaultOptions,
    ...options,
  };

  // 发送请求
  return fetch(url, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Request failed:', error);
      throw error;
    });
}

export function validateObject(
  obj: any,
  fields: {
    name: string;
    type: string;
  }[]
): boolean {
  const objFields = Object.keys(obj).map((key) => ({
    name: key,
    type: typeof obj[key],
  }));
  if (fields.length !== objFields.length) {
    throw new Error(`Field length is not equal`);
  }

  return fields.every((rule) => {
    const objField = objFields.find((field) => field.name === rule.name) as {
      name: string;
      type: string;
    };
    if (!objField) {
      throw new Error(`Field ${rule.name} is required`);
    }
    return objField;
  });
}

export function encodeOnChainData(
  data: any,
  dataLocation: DataLocationOnChain,
  schemaData: SchemaItem[]
): string {
  return encodeAbiParameters<any>(
    dataLocation === DataLocationOnChain.ONCHAIN
      ? schemaData
      : [{ type: 'string' }],
    dataLocation === DataLocationOnChain.ONCHAIN
      ? (schemaData as SchemaItem[]).map(
          (item: any) =>
            (
              data as {
                [key: string]: any;
              }
            )[item.name]
        )
      : [data]
  );
}

export function decodeOnChainData(
  data: any,
  dataLocation: DataLocationOnChain,
  schemaData: SchemaItem[]
): any {
  try {
    const decodeData = decodeAbiParameters(
      [
        dataLocation === DataLocationOnChain.ONCHAIN
          ? { components: schemaData, type: 'tuple' }
          : { type: 'string' },
      ],
      data
    );
    return decodeData[0];
  } catch (error) {
    const decodeData = decodeAbiParameters(
      dataLocation === DataLocationOnChain.ONCHAIN
        ? schemaData
        : [{ type: 'string' }],
      data
    );
    const obj: any = {};
    schemaData.forEach((item, i) => {
      obj[item.name] = decodeData[i];
    });
    return obj;
  }
}

export const stringifyQueryString = (obj: Record<string, any>): string => {
  return queryString.stringify(obj, { skipNull: true, skipEmptyString: true });
};

export const parseQuery = (params: string): Record<string, any> => {
  return queryString.parse(params);
};
