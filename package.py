import os
import zipfile

output_filename = 'scorm-quiz-package.zip'
files_to_include = ['imsmanifest.xml', 'index.html', 'styles.css', 'script.js', 'logic.js']

with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for file in files_to_include:
        if os.path.exists(file):
            zipf.write(file)
            print(f'Added to package: {file}')
        else:
            print(f'Warning: Required file missing -> {file}')

print(f'\nSuccess! LMS-ready package generated: {os.path.abspath(output_filename)}')
