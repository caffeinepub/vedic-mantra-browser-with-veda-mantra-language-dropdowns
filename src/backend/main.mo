import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Migration "migration";

(with migration = Migration.run)
actor {
  type Language = {
    #telugu;
    #english;
    #hindi;
  };

  type Translation = {
    telugu : Text;
    english : Text;
    hindi : Text;
  };

  type MantraWithTranslation = {
    translation : Text;
    meaning : Text;
  };

  type MantraWithTranslations = {
    telugu : MantraWithTranslation;
    english : MantraWithTranslation;
    hindi : MantraWithTranslation;
  };

  type Veda = {
    #rikVeda;
    #yajurVeda;
    #samaVeda;
    #atharvaVeda;
  };

  type Mantra = {
    veda : Veda;
    mantraNumber : Nat;
  };

  module Mantra {
    public func compare(x : Mantra, y : Mantra) : Order.Order {
      Nat.compare(x.mantraNumber, y.mantraNumber);
    };
  };

  type MantraEntry = {
    veda : Veda;
    mantraNumber : Nat;
    translations : MantraWithTranslations;
  };

  // Persistent store for mantras and their translations
  let mantras = Map.empty<Mantra, MantraWithTranslations>();

  public query ({ caller }) func getMantraNumbers(veda : Veda) : async [Nat] {
    let filteredMantras = mantras.keys().toArray().filter(
      func(entry) {
        entry.veda == veda;
      }
    );
    filteredMantras.map(
      func(mantra) {
        mantra.mantraNumber;
      }
    );
  };

  public query ({ caller }) func getMantraMeaning(
    veda : Veda,
    mantraNumber : Nat,
    language : Language,
  ) : async ?Text {
    let k : Mantra = {
      veda;
      mantraNumber;
    };
    switch (mantras.get(k)) {
      case (null) { null };
      case (?translations) {
        switch (language) {
          case (#telugu) { ?translations.telugu.meaning };
          case (#english) { ?translations.english.meaning };
          case (#hindi) { ?translations.hindi.meaning };
        };
      };
    };
  };

  public query ({ caller }) func getMantraText(
    veda : Veda,
    mantraNumber : Nat,
    language : Language,
  ) : async ?Text {
    let k : Mantra = {
      veda;
      mantraNumber;
    };
    switch (mantras.get(k)) {
      case (null) { null };
      case (?translations) {
        switch (language) {
          case (#telugu) { ?translations.telugu.translation };
          case (#english) { ?translations.english.translation };
          case (#hindi) { ?translations.hindi.translation };
        };
      };
    };
  };
};
