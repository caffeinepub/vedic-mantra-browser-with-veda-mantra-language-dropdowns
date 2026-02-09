import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type Language = {
    #telugu;
    #english;
    #hindi;
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

  type MantraMetadata = {
    telugu : Text;
    hindi : Text;
    english : Text;
  };

  type Mantra = {
    veda : Veda;
    mantraNumber : Nat;
  };

  module Mantra {
    public func compare(x : Mantra, y : Mantra) : Order.Order {
      switch (Nat.compare(x.mantraNumber, y.mantraNumber)) {
        case (#equal) {
          switch (x.veda, y.veda) {
            case (#rikVeda, #rikVeda) { #equal };
            case (#rikVeda, _) { #less };
            case (#yajurVeda, #rikVeda) { #greater };
            case (#yajurVeda, #yajurVeda) { #equal };
            case (#yajurVeda, _) { #less };
            case (#samaVeda, #atharvaVeda) { #less };
            case (#samaVeda, #samaVeda) { #equal };
            case (#atharvaVeda, #atharvaVeda) { #equal };
            case (_) { #greater };
          };
        };
        case (other) { other };
      };
    };
  };

  let mantras = Map.fromIter<Mantra, MantraWithTranslations>(
    [
      (
        { veda = #samaVeda; mantraNumber = 47 },
        {
          telugu = {
            translation = "అదర్శి న యఖ్జవిత్తమః\u{A}యస్మిన్ వ్రత్యాని ఆదధుః\u{A}ఉపో షు జాత మార్యస్య వర్థనం అగ్నిం నక్షంతు\u{A}నో గిరః  ";
            meaning = "సాహసస్తమైన యజ్ఞద్రవ్యాన్ని పొందిన గారు గుర్తించబడ్డారు.\u{A}ఆయన ఆచరణతో మన కర్తవ్యాలను ఒకచోట చేర్చారు.\u{A}మీ కొత్త తేజస్సుతో మాతో చేరిన మీరు\u{A}మా ప్రార్థనలను వినగలరో";
          };
          english = {
            translation = "adarśi nā yakhjavittamaḥ, yasmīn vratyāni ādadhuḥ, upo ṣu jāta māryasya vardhanaṃ agniṃ nakṣantu, no giraḥ  ";
            meaning = "The bravest among us, who had attained the means of sacrifice, has been recognized. His conduct has united our duties. If, with your newfound radiance, you join us, may you hear our prayers.";
          };
          hindi = {
            translation = "अदर्शि गातुवित्तमो यस्मिन्व्रतान्यादधुः\nउपो षु जातमार्यस्य वर्धनमग्निं नक्षन्तु नो गिरः";
            meaning = "हमारे बीच सबसे साहसी, जिन्होंने यज्ञ के साधनों को प्राप्त कर लिया था, उनकी पहचान हो गई है। उनके आचरण ने हमारे कर्तव्यों को एकजुट कर दिया है। यदि आप अपनी नई चमक के साथ हमारे साथ आ जाते हैं, तो कृपया हमारी प्रार्थनाएं सुन लें।  (४७)";
          };
        },
      ),
    ].values(),
  );

  let mantraMetadata = Map.fromIter<Mantra, MantraMetadata>(
    [
      (
        { veda = #samaVeda; mantraNumber = 47 },
        {
          telugu = "దేవత: అగ్నిః ఋషిః సౌభరి: కాణ్వః ఛందస్: బృహతీ స్వరః మధ్యమః కాండ: అగ్నేయం కాండం";
          english = "Deity: Agni, Rishi: Soubhari Kanva, Meter: Brihati, Svara: Madhyama, Kanda: Agneya Kanda";
          hindi = "देवता: अग्निः ऋषि: सौभरि: काण्व: छन्द: बृहती स्वर: मध्यमः काण्ड: आग्नेयं काण्डम्";
        },
      ),
    ].values(),
  );

  let mantraAudioFiles = Map.empty<Mantra, Storage.ExternalBlob>();

  public query ({ caller }) func getMantraNumbers(veda : Veda) : async [Nat] {
    mantras.keys().toArray().filter(func(entry) { entry.veda == veda }).map(func(mantra) { mantra.mantraNumber });
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

  public query ({ caller }) func getMantraMetadata(
    veda : Veda,
    mantraNumber : Nat,
    language : Language,
  ) : async ?Text {
    let k : Mantra = {
      veda;
      mantraNumber;
    };
    switch (mantraMetadata.get(k)) {
      case (null) { null };
      case (?metadata) {
        switch (language) {
          case (#telugu) { ?metadata.telugu };
          case (#english) { ?metadata.english };
          case (#hindi) { ?metadata.hindi };
        };
      };
    };
  };

  public shared ({ caller }) func addMantraAudioFile(
    veda : Veda,
    mantraNumber : Nat,
    blob : Storage.ExternalBlob,
  ) : async () {
    let k : Mantra = {
      veda;
      mantraNumber;
    };
    mantraAudioFiles.add(k, blob);
  };

  public query ({ caller }) func getMantraAudioFile(
    veda : Veda,
    mantraNumber : Nat,
  ) : async ?Storage.ExternalBlob {
    let k : Mantra = {
      veda;
      mantraNumber;
    };
    mantraAudioFiles.get(k);
  };
};
