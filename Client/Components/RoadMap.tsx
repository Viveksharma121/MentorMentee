import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Pdf from 'react-native-pdf';

const RoadmapScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPdf, setShowPdf] = useState(false);

  const handleCategoryPress = category => {
    setSelectedCategory(category);
    setShowPdf(true);
  };

  const handleCancelPress = () => {
    setSelectedCategory(null);
    setShowPdf(false);
  };

  //hardcoded roadmaps
  const pdfLinks = [
    {category: 'C++', link: 'https://roadmap.sh/pdfs/roadmaps/cpp.pdf'},
    {
      category: 'Frontend',
      link: 'https://roadmap.sh/pdfs/roadmaps/frontend.pdf',
    },
    {category: 'Backend', link: 'https://roadmap.sh/pdfs/roadmaps/backend.pdf'},
    {category: 'DevOps', link: 'https://roadmap.sh/pdfs/roadmaps/devops.pdf'},
    {
      category: 'Full Stack',
      link: 'https://roadmap.sh/pdfs/roadmaps/full-stack.pdf',
    },
    {
      category: 'Data Structures and Algorithms',
      link: 'https://roadmap.sh/pdfs/roadmaps/datastructures-and-algorithms.pdf',
    },
    {
      category: 'Cyber Security',
      link: 'https://roadmap.sh/pdfs/roadmaps/cyber-security.pdf',
    },
    {category: 'QA', link: 'https://roadmap.sh/pdfs/roadmaps/qa.pdf'},
    {
      category: 'Blockchain',
      link: 'https://roadmap.sh/pdfs/roadmaps/blockchain.pdf',
    },
    {
      category: 'AI and Data Scientist',
      link: 'https://roadmap.sh/pdfs/roadmaps/ai-data-scientist.pdf',
    },
    {
      category: 'PostgreSQL DBA',
      link: 'https://roadmap.sh/pdfs/roadmaps/postgresql-dba.pdf',
    },
    {category: 'Android', link: 'https://roadmap.sh/pdfs/roadmaps/android.pdf'},
    {
      category: 'Computer Science',
      link: 'https://roadmap.sh/pdfs/roadmaps/computer-science.pdf',
    },
    {category: 'SQL', link: 'https://roadmap.sh/pdfs/roadmaps/sql.pdf'},
    {category: 'Python', link: 'https://roadmap.sh/pdfs/roadmaps/python.pdf'},
    {
      category: 'TypeScript',
      link: 'https://roadmap.sh/pdfs/roadmaps/typescript.pdf',
    },
    {category: 'Node.js', link: 'https://roadmap.sh/pdfs/roadmaps/nodejs.pdf'},
    {
      category: 'JavaScript',
      link: 'https://roadmap.sh/pdfs/roadmaps/javascript.pdf',
    },
    {category: 'Vue', link: 'https://roadmap.sh/pdfs/roadmaps/vue.pdf'},
    {category: 'Angular', link: 'https://roadmap.sh/pdfs/roadmaps/angular.pdf'},
    {category: 'React', link: 'https://roadmap.sh/pdfs/roadmaps/react.pdf'},
    {category: 'AWS', link: 'https://roadmap.sh/pdfs/best-practices/aws.pdf'},
    {
      category: 'Code Reviews',
      link: 'https://roadmap.sh/pdfs/best-practices/code-review.pdf',
    },
    {
      category: 'API Security',
      link: 'https://roadmap.sh/pdfs/best-practices/api-security.pdf',
    },
    {
      category: 'Frontend Performance',
      link: 'https://roadmap.sh/pdfs/best-practices/frontend-performance.pdf',
    },
  ];

  const getCategoryPDFLink = (category: string) => {
    const pdf = pdfLinks.find(pdf => pdf.category === category);
    return pdf ? pdf.link : null;
  };
  return (
    <View style={styles.container}>
      {showPdf ? (
        <View style={styles.pdfContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelPress}>
            <Text style={styles.cancelText}>X</Text>
          </TouchableOpacity>
          <Pdf
            trustAllCerts={false}
            source={{uri: getCategoryPDFLink(selectedCategory), cache: true}}
            onLoadComplete={(numberOfPages, filePath) => {
              console.log(`Number of pages: ${numberOfPages}`);
            }}
            onPageChanged={(page, numberOfPages) => {
              console.log(`Current page: ${page}`);
            }}
            onError={error => {
              console.log(error);
            }}
            style={styles.pdf}
          />
        </View>
      ) : (
        <View>
          <Text style={styles.sectionTitle}>Role-based Roadmap</Text>
          <View style={styles.categoryContainer}>
            {roleBasedRoadmap.map(category => (
              <TouchableOpacity
                key={category}
                style={styles.categoryButton}
                onPress={() => handleCategoryPress(category)}>
                <Text>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Skill Based Roadmaps</Text>
          <View style={styles.categoryContainer}>
            {skillBasedRoadmap.map(category => (
              <TouchableOpacity
                key={category}
                style={styles.categoryButton}
                onPress={() => handleCategoryPress(category)}>
                <Text>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Best Practices Roadmap</Text>
          <View style={styles.categoryContainer}>
            {bestPractices.map(category => (
              <TouchableOpacity
                key={category}
                style={styles.categoryButton}
                onPress={() => handleCategoryPress(category)}>
                <Text>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// our categories
const roleBasedRoadmap = [
  'Frontend',
  'Backend',
  'DevOps',
  'Full Stack',
  'Android',
  'PostgreSQL',
  'Data Structures and Algorithms',
  'Blockchain',
  'QA',
  'Cyber Security',
  'AI and Data Scientist',
  'C++',
];
const skillBasedRoadmap = [
  'Computer Science',
  'SQL',
  'Python',
  'TypeScript',
  'Node.js',
  'JavaScript',
  'Vue',
  'Angular',
  'React',
];
const bestPractices = [
  'AWS',
  'Code Reviews',
  'API Security',
  'Frontend Performance',
];

//css
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  pdfContainer: {
    flex: 1,
    marginTop: 20,
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
  cancelButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 15,
  },
  cancelText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RoadmapScreen;
