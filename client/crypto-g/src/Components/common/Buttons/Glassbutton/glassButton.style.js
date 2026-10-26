import styled from "styled-components";
import {colors} from "../../../../styles-common/common.style";

export const GlassButton = styled.button`
  margin: 0 auto;
  border: none;
  border-radius: 3px;
  font-size:  ${ ({fontSize}) => fontSize + 'rem' ? fontSize + 'rem' : '1.2rem'};
  padding: ${ ({paddingOption}) => paddingOption ? paddingOption : colors.packageStandart5px};
  background: #fff; /* запасной цвет для старых браузеров */
  background: ${ ({backgroundOption}) => backgroundOption ? backgroundOption : colors.transparentBackground};
  color: inherit;
  text-align: center;
  text-decoration: none;
  letter-spacing: .5px;
  font-family: inherit;
  cursor: pointer;
  transition: .8s;
  :${colors.fireHover}

  :disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
