import passport from "passport";
import { setupJwtStrategy } from "../common/strategies/jwt.strategies";


const intializePassport = () => {
  setupJwtStrategy(passport);
};

intializePassport();
export default passport;
