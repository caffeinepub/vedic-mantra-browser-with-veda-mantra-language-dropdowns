import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type Mantra = {
    veda : {
      #rikVeda;
      #yajurVeda;
      #samaVeda;
      #atharvaVeda;
    };
    mantraNumber : Nat;
  };

  public func run(old : { mantras : Map.Map<Mantra, { telugu : { translation : Text; meaning : Text }; english : { translation : Text; meaning : Text }; hindi : { translation : Text; meaning : Text } }> }) : { mantras : Map.Map<Mantra, { telugu : { translation : Text; meaning : Text }; english : { translation : Text; meaning : Text }; hindi : { translation : Text; meaning : Text } }> } {
    old;
  };
};
