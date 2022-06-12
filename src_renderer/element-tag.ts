import ElementType from "./element-type";

export function getElementTag(type: ElementType) {
  if (type == ElementType.Paragraph) {
    return 'p';
  } else if (type == ElementType.Heading1) {
    return 'h1';
  } else if (type == ElementType.Heading2) {
    return 'h2';
  } else if (type == ElementType.Heading3) {
    return 'h3';
  } else if (type == ElementType.Heading4) {
    return 'h4';
  } else if (type == ElementType.Heading5) {
    return 'h5';
  } else if (type == ElementType.Heading6) {
    return 'h6';
  } else if (type == ElementType.Math) {
    return 'math';
  }

  throw new Error('Unsupported');
}