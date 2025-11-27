from typing import Dict, List
from app.models.InterestsEnum import InterestsEnum

# Map enum values to OSM-like tags for filtering POIs.
interest_tags: Dict[str, List[str]] = {
    InterestsEnum.MUSEUMS.value:      ["tourism:museum", "historic:monument"],
    InterestsEnum.ART.value:          ["tourism:artwork", "historic:memorial"],
    InterestsEnum.HISTORY.value:      ["historic:yes", "historic:archaeological_site"],
    InterestsEnum.ARCHITECTURE.value: ["building:architecture", "historic:yes"],
    InterestsEnum.NATURE.value:       ["natural:wood", "natural:water", "natural:peak"],
    InterestsEnum.PARKS.value:        ["leisure:park"],
    InterestsEnum.CAFES.value:        ["amenity:cafe"],
    InterestsEnum.RESTAURANTS.value:  ["amenity:restaurant", "cuisine:*"],  # * wildcard
    InterestsEnum.SHOPPING.value:     ["shop:*"],
    InterestsEnum.SPORTS.value:       ["leisure:stadium", "leisure:sports_centre"],
    InterestsEnum.ACTIVE.value:       ["leisure:fitness_station", "leisure:trail"],
    InterestsEnum.RECREATION.value:   ["amenity:playground", "leisure:park"],
    InterestsEnum.NIGHTLIFE.value:    ["amenity:bar", "amenity:nightclub"],
    InterestsEnum.LOCAL.value:        ["tourism:attraction"],
    InterestsEnum.CUISINE.value:      ["cuisine:*"],
    InterestsEnum.PHOTOGRAPHY.value:  ["tourism:viewpoint"],
    InterestsEnum.QUIET.value:        ["amenity:bench", "leisure:park"],
    InterestsEnum.PLACES.value:       ["tourism:attraction"],
}
