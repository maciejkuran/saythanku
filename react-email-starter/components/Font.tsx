interface Props {
  webFont: {
    url: string;
    format: string;
  };
  fontStyle: string;
  fontFamily: string;
  fontWeight: number;
  fallbackFontFamily: string;
}

const Font = ({
  webFont,
  fontStyle = 'normal',
  fontFamily,
  fontWeight = 400,
  fallbackFontFamily,
}: Props) => {
  const src = webFont ? `src: url(${webFont?.url!}) format(${webFont.format});` : '';

  return (
    <style>
      {`
            @font-face {
                font-style: ${fontStyle};
                font-family: ${fontFamily};
                font-weight: ${fontWeight};
                mso-font-alt: ${
                  Array.isArray(fallbackFontFamily) ? fallbackFontFamily[0] : fallbackFontFamily
                };
                ${src}
            }

            * {
                font-family: ${fontFamily}, ${
        Array.isArray(fallbackFontFamily) ? fallbackFontFamily.join(', ') : fallbackFontFamily
      };
            }
            `}
    </style>
  );
};

export default Font;
